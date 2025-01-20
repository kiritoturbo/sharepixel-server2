const router = require('express').Router()
const ctrls = require('../controllers/tokenfb')
const {  isAdminWordpress,verifyAccessTokenWordpress}= require('../middlewares/verifyToken')



router.get('/gettokenfb',verifyAccessTokenWordpress,ctrls.getTokenbm)      
router.get('/getAllHistorySharePixel',verifyAccessTokenWordpress,ctrls.getAllHistorySharePixel)      
router.get('/getAllHistorySharePixeladmin',verifyAccessTokenWordpress,isAdminWordpress,ctrls.getAllHistorySharePixeladmin)      
router.get('/gettokenfbforadmin',verifyAccessTokenWordpress,isAdminWordpress,ctrls.getTotalSharesByUser)      
router.post('/updatetokenfb',verifyAccessTokenWordpress,isAdminWordpress,ctrls.addtokenbm)      
router.post('/sharepixelfb',verifyAccessTokenWordpress,ctrls.sharepixelfacebook)      
// router.get('/current',verifyAccessToken,ctrls.getCurrent)      

module.exports=router