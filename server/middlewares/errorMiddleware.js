const errorHandler = (err,req,res,next)=>{
    console.error(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const payload = { success: false, message };

    if (process.env.NODE_ENV === 'development') {
        payload.stack = err.stack;
    }

    res.status(status).json(payload);
}

export default errorHandler;