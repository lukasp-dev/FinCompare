import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    console.log(res.oidc.isAuthenticated())
    res.render("index", {title:"FinCompare"})
});

export default router;
