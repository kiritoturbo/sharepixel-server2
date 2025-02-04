const Tokenfb=require('../models/tokenfb') 
const historysharepixel=require('../models/historysharepx') 
const asyncHandler=require('express-async-handler')
const axios = require('axios');
const moment = require('moment');


const addtokenbm =asyncHandler(async (req,res) => {
    const{tokenbm, bmid}=req.body
    
    if(!tokenbm){
        return res.status(400).json({
            success:false,
            mess:'Missing inputs'
        })
    }

    const updatedToken = await Tokenfb.findByIdAndUpdate(
        '677b999ee9c1b9f216c5fd52', 
        { tokenbm, bmid }, // Dữ liệu cần cập nhật
        { new: true, upsert: true } 
    );

    return res.status(200).json({
        success: true,
        mess: 'Token đã được cập nhật thành công',
        // data: updatedToken,
    });
})
// Lấy dữ liệu từ MongoDB
const getTokenbm = asyncHandler(async (req, res) => {
    const { _id } = req.query;

    if (!_id) {
        return res.status(400).json({
            success: false,
            mess: 'Missing _id in request',
        });
    }

    const tokenData = await Tokenfb.findById(_id);

    if (!tokenData) {
        return res.status(404).json({
            success: false,
            mess: 'Token not found',
        });
    }

    // Trả về bản ghi
    return res.status(200).json({
        success: true,
        data: tokenData,
    });
});
//sharepixel
const sharepixelfacebook =asyncHandler(async (req,res) => {
    const {phanquyen} = req.user
    if(phanquyen == 1 || phanquyen == "" ){
        return res.status(500).json({
            success: false,
            mess: 'Share Pixel Lỗi hoặc Token Die - Vui lòng liên hệ trực tiếp với nhóm Support để được hỗ trợ',
        });
    }
    // // console.log(req.user)
    // return
    const{idpixel, idads,idbm}=req.body
    
    if(!idpixel || !idads || !idbm){
        return res.status(400).json({
            success:false,
            mess:'Missing inputs'
        })
    }

    // Lấy tokenbm từ database
    const record = await Tokenfb.findById('677b999ee9c1b9f216c5fd52');
    if (!record) {
        return res.status(404).json({
            success: false,
            mess: 'Token record not found',
        });
    }

    // Tách tokenbm thành mảng
    const tokens = record.tokenbm.split('|').filter(token => token.trim() !== '');

    if (tokens.length === 0) {
        return res.status(400).json({
            success: false,
            mess: 'No valid tokens found in the record',
        });
    }
    
    // Dữ liệu cần gửi đến Facebook API
    const url = `https://graph.facebook.com/v19.0/${idpixel}/shared_accounts`;
    const params = {
        method: 'POST',
        suppress_http_code: 1,
        locale: 'en_US',
        account_id: idads,
        business: idbm,
    };


    let success = false;
    let usedToken = null;

    // Thử từng token trong mảng
    // for (const token of tokens) {
    //     try {
    //         const response = await axios.post(url, null, {
    //             params: { ...params, access_token: token },
    //         });
            
    //         // Kiểm tra nếu share thành công
    //         if (response.data && response.data.success) {
    //             success = true;
    //             usedToken = token.substring(0, 20);
    //             // Lưu trạng thái thành công vào MongoDB
    //             await historysharepixel.create({
    //                 idads,
    //                 idpixel,
    //                 trangthai: 'success',
    //                 user_id: req.user?.id || null, 
    //                 name: req.user?.name || null, 
    //                 phanquyen: req.user?.phanquyen || null, 
    //                 tokenbm: usedToken.substring(0, 20), 
    //             });
    //             break; // Thoát khỏi vòng lặp
    //         }else {
    //             // Lưu trạng thái thất bại vào MongoDB nếu không thành công
    //             usedToken = token.substring(0, 20);
    //             await historysharepixel.create({
    //                 idads,
    //                 idpixel,
    //                 trangthai: 'error',
    //                 user_id: req.user?.id || null, 
    //                 name: req.user?.name || null, 
    //                 phanquyen: req.user?.phanquyen || null,  
    //                 tokenbm: token.substring(0, 20),   // Lấy 10 ký tự đầu
    //             });
    //         }
    //     } catch (error) {
            
    //         console.log(`Token failed: ${token}`, error.message);
    //     }
    // }

    // // Nếu thành công, trả về kết quả
    // if (success) {
    //     return res.status(200).json({
    //         success: true,
    //         mess: 'Pixel shared successfully',
    //         usedToken,
    //     });
    // }else {
    //     return res.status(200).json({
    //         success: false,
    //         mess: 'Error Pixel shared',
    //         usedToken
    //     });
    // }
    const promises = tokens.map(async (token) => {
        try {
            const response = await axios.post(url, null, {
                params: { ...params, access_token: token },
            });
    
            if (response.data && response.data.success) {
                await historysharepixel.create({
                    idads,
                    idpixel,
                    trangthai: 'success',
                    user_id: req.user?.id || null, 
                    name: req.user?.name || null, 
                    phanquyen: req.user?.phanquyen || null, 
                    tokenbm: token.substring(0, 20), 
                });
                return { success: true, token };
            } else {
                await historysharepixel.create({
                    idads,
                    idpixel,
                    trangthai: 'error',
                    user_id: req.user?.id || null, 
                    name: req.user?.name || null, 
                    phanquyen: req.user?.phanquyen || null,  
                    tokenbm: token.substring(0, 20),
                });
            }
        } catch (error) {
            console.log(`Token failed: ${token}`, error.message);
        }
        return { success: false, token };
    });
    
    const results = await Promise.all(promises);
    
    // Tìm token thành công
    const successfulResult = results.find(result => result.success);
    
    if (successfulResult) {
        return res.status(200).json({
            success: true,
            mess: 'Pixel shared successfully',
            usedToken: successfulResult.token.substring(0, 20),
        });
    } else {
        return res.status(500).json({
            success: false,
            mess: 'All tokens failed to share the pixel',
        });
    }
    

    // Nếu không token nào hoạt động
    return res.status(500).json({
        success: false,
        mess: 'All tokens failed to share the pixel',
    });
})

// get lịch sử sharepixel
const getAllHistorySharePixel = asyncHandler(async (req, res) => {
    const user = req.user
    const { startDate, endDate } = req.query;
    try {
        let filter = { user_id: user.id }; // Mặc định không lọc theo ngày

        // Nếu có startDate và endDate, ta sẽ lọc theo khoảng thời gian
        if (startDate && endDate) {
            // Chuyển đổi startDate và endDate sang thời gian UTC-7 nếu cần thiết
            const start = moment(startDate).startOf('day').utcOffset(-7, true).toDate(); // Convert startDate
            const end = moment(endDate).endOf('day').utcOffset(-7, true).toDate(); // Convert endDate

            // Thêm điều kiện lọc theo ngày
            filter.createdAt = { $gte: start, $lte: end }; // Lọc theo ngày (createdAt nằm trong khoảng từ startDate đến endDate)
        }
        // const historyRecords = await historysharepixel.find({ user_id: user.id }); // Lấy tất cả các bản ghi từ MongoDB
        const historyRecords = await historysharepixel.find(filter); 

        if (!historyRecords || historyRecords.length === 0) {
            return res.status(404).json({
                success: false,
                mess: 'No records found',
            });
        }

        return res.status(200).json({
            success: true,
            data: historyRecords,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error fetching records',
            error: error.message,
        });
    }
});

// get lịch sử sharepixel for admin
const getAllHistorySharePixeladmin = asyncHandler(async (req, res) => {
    const user = req.user
    const { startDate, endDate } = req.query;
    try {
        let filter = {}; // Mặc định không lọc theo ngày

        // Nếu có startDate và endDate, ta sẽ lọc theo khoảng thời gian
        if (startDate && endDate) {
            // Chuyển đổi startDate và endDate sang thời gian UTC-7 nếu cần thiết
            const start = moment(startDate).startOf('day').utcOffset(-7, true).toDate(); // Convert startDate
            const end = moment(endDate).endOf('day').utcOffset(-7, true).toDate(); // Convert endDate

            // Thêm điều kiện lọc theo ngày
            filter.createdAt = { $gte: start, $lte: end }; // Lọc theo ngày (createdAt nằm trong khoảng từ startDate đến endDate)
        }
        const historyRecords = await historysharepixel.find(filter); // Lấy tất cả các bản ghi từ MongoDB

        if (!historyRecords || historyRecords.length === 0) {
            return res.status(404).json({
                success: false,
                mess: 'No records found',
            });
        }

        return res.status(200).json({
            success: true,
            data: historyRecords,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mess: 'Error fetching records',
            error: error.message,
        });
    }
});
//get tổng sharepixel của từng user cho admin xem 
// const getTotalSharesByUser = asyncHandler(async (req, res) => {
//     try {
//         const { date } = req.query; // Ví dụ: '2024-01-08'
//         // Lấy tất cả các bản ghi từ cơ sở dữ liệu
//         const historyRecords = await historysharepixel.find();

//         if (!historyRecords || historyRecords.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 mess: 'No records found',
//             });
//         }

//         // Tổng hợp tổng số lượt chia sẻ thành công cho từng user_id
//         const totalSharesByUser = historyRecords.reduce((acc, record) => {
//             const userId = record.user_id;
//             const userName = record.name;
//             if (!acc[userId]) {
//                 acc[userId] = { totalShares: 0, name: userName }; // Khởi tạo nếu chưa có user_id trong accumulator
//             }
//             acc[userId].totalShares += 1; // Tăng tổng số lượt chia sẻ thành công nếu success = true
//             return acc;
//         }, {});

//         return res.status(200).json({
//             success: true,
//             data: totalSharesByUser,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             mess: 'Error fetching records',
//             error: error.message,
//         });
//     }
// });
const getTotalSharesByUser = asyncHandler(async (req, res) => {
    try {
        // Lấy ngày từ query parameter (hoặc có thể là từ request body nếu bạn muốn)
        const { startDate, endDate } = req.query;

        // Nếu thiếu startDate hoặc endDate, trả về lỗi
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                mess: 'startDate and endDate are required',
            });
        }

        // Lấy tất cả các bản ghi từ cơ sở dữ liệu và lọc theo ngày
        const historyRecords = await historysharepixel.find({
            createdAt: {
                $gte: new Date(`${startDate}T00:00:00Z`),  // Bắt đầu từ 00:00 ngày
                $lte: new Date(`${endDate}T23:59:59Z`),  // Kết thúc lúc 23:59 ngày
            },
        });

        if (!historyRecords || historyRecords.length === 0) {
            return res.status(404).json({
                success: false,
                mes: 'No records found for the given date',
            });
        }

        // Tổng hợp tổng số lượt chia sẻ thành công cho từng user_id
        const totalSharesByUser = historyRecords.reduce((acc, record) => {
            const userId = record.user_id;
            const userName = record.name;
            if (!acc[userId]) {
                acc[userId] = { totalShares: 0, name: userName }; // Khởi tạo nếu chưa có user_id trong accumulator
            }
            acc[userId].totalShares += 1; // Tăng tổng số lượt chia sẻ thành công nếu success = true
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            data: totalSharesByUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            mes: 'Error fetching records',
            error: error.message,
        });
    }
});



module.exports={
    addtokenbm,
    getTokenbm,
    sharepixelfacebook,
    getAllHistorySharePixel,
    getTotalSharesByUser,
    getAllHistorySharePixeladmin
}