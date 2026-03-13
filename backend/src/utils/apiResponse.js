export const sendResponse = (res, statuscode, message , data = null) => {
    res.status(statuscode).json({
        success: true,
        message,
        data
    });
};