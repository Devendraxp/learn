import { Webhook } from 'svix';
import User from '../models/User.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';

//api controller function to manage clerk user with database

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        })

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id || data._id,
                    email: data.email_addresses?.[0]?.email_address || '',
                    name: (data.first_name || '') + " " + (data.last_name || ''),
                    imageUrl: data.image_url || '',
                }
                await User.create(userData)
                res.json({ success: true })
                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses?.[0]?.email_address || '',
                    name: (data.first_name || '') + " " + (data.last_name || ''),
                    imageUrl: data.image_url || '',
                }
                await User.findByIdAndUpdate(data.id || data._id, userData)
                res.json({ success: true })
                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id || data._id)
                res.json({ success: true })
                break;
            }

            default:
                res.json({ success: false, message: "Unknown webhook type" })
                break
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const body = req.body;

    if (!sig) {
        return res.json({ message: 'Webhook endpoint is working' });
    }

    if (!body) {
        return res.status(400).send('No request body');
    }

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    } catch (err) {
        console.error('Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const purchaseId = session?.metadata?.purchaseId;

                console.log('checkout.session.completed received, session id:', session?.id, 'purchaseId:', purchaseId);

                if (purchaseId) {
                    const purchaseData = await Purchase.findById(purchaseId);
                    if (purchaseData) {
                        const userData = await User.findById(purchaseData.userId);
                        const courseData = await Course.findById(purchaseData.courseId);

                        // Update purchase status and stripeSessionId
                        await Purchase.findByIdAndUpdate(purchaseId, { status: 'completed', stripeSessionId: session.id });

                        // Enroll user
                        if (courseData && !courseData.enrolledStudents.includes(purchaseData.userId)) {
                            courseData.enrolledStudents.push(purchaseData.userId);
                            await courseData.save();
                        }

                        if (userData && !userData.enrolledCourses.includes(purchaseData.courseId)) {
                            userData.enrolledCourses.push(purchaseData.courseId);
                            await userData.save();
                        }
                    }
                }

                break;
            }
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const sessions = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });

                if (sessions.data.length > 0) {
                    const session = sessions.data[0];
                    const { purchaseId } = session.metadata;

                    if (purchaseId) {
                        const purchaseData = await Purchase.findById(purchaseId);
                        const userData = await User.findById(purchaseData.userId);
                        const courseData = await Course.findById(purchaseData.courseId);

                        await Purchase.findByIdAndUpdate(purchaseId, {
                            status: 'completed',
                            stripeSessionId: session.id
                        });

                        // Enroll user in course
                        if (!courseData.enrolledStudents.includes(purchaseData.userId)) {
                            courseData.enrolledStudents.push(purchaseData.userId);
                            await courseData.save();
                            // Added user to course enrolledStudents
                        } else {
                            // User already enrolled
                        }

                        if (!userData.enrolledCourses.includes(purchaseData.courseId)) {
                            userData.enrolledCourses.push(purchaseData.courseId);
                            await userData.save();
                        }
                    }
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const sessions = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId
                });

                if (sessions.data.length > 0) {
                    const { purchaseId } = sessions.data[0].metadata;

                    if (purchaseId) {
                        // Update purchase status to failed
                        await Purchase.findByIdAndUpdate(purchaseId, {
                            status: 'failed'
                        });
                    }
                }
                break;
            }
        }
        res.json({ received: true, eventType: event.type });

    } catch (error) {
        console.error('Error processing webhook:', error.message);
        console.error(error.stack);
        res.status(500).send(`Error processing webhook: ${error.message}`);
    }

}