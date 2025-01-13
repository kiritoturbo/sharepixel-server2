const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// Chuỗi secret_key từ WordPress
const secretKey = 'testing1234453656347nsmvfdbsrtgjnfsjhNJFDJFujragrg';

// Hàm để giải mã access_token
function decodeAccessToken(accessToken) {
    try {
        // Giải mã token
        const decoded = jwt.verify(accessToken, secretKey, { algorithms: ['HS256'] });
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Token has expired');
        } else {
            console.error('Error decoding token:', err.message);
        }
        return null;
    }
}

// Middleware xác thực
const verifyAccessTokenWordpress = (req, res, next) => {
    try {
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            // Lấy token từ Authorization header
            const token = req.headers.authorization.split(' ')[1];
            // Giải mã token
            const decoded = decodeAccessToken(token);
            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    mes: 'Invalid access token',
                });
            }

            // Lưu thông tin giải mã vào req.user
            req.user = decoded;
            next();
        } else {
            return res.status(401).json({
                success: false,
                mes: 'Require authentication!!!',
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            mes: 'Something went wrong',
        });
    }
};

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // Bearer token
    // headers: { authorization: Bearer token}
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).json({//lấy refresh token để lấy token mới 
                success: false,
                mes: 'Invalid access token'
            })
            req.user = decode
            next()
        })
    } else {
        return res.status(401).json({
            success: false,
            mes: 'Require authentication!!!'
        })
    }
})
const isAdmin = asyncHandler((req, res, next) => {
    const { role } = req.user
    if (role !== 'admin')
        return res.status(401).json({
            success: false,
            mes: ' REQUIRE ADMIN ROLE'
        })
    next()
})
const isAdminWordpress = asyncHandler((req, res, next) => {
    const { roles } = req.user
    if (!roles.includes('administrator'))
        return res.status(401).json({
            success: false,
            mes: ' REQUIRE ADMIN ROLE'
        })
    next()
})

module.exports = {
    verifyAccessToken,
    isAdmin,
    verifyAccessTokenWordpress,
    isAdminWordpress
}