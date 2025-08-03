
const Product = require("../model/Product");
const multer = require("multer");
const  Firm = require('../model/Firm')


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() +  path.extname( file.originalname));
    }
});

const upload = multer({ storage: storage });  // ✅ ADD THIS

const addProduct = async(req, res) => {

    try {
        const {productName, price, category, bestseller, description}  =req.body;
        const image = req.file ? req.file.filename : undefined;
        
        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if(!firm) {
            return res.status(404).json({error: "no firm found"})
        }

        const product = new Product({
            
             productName, 
             price,
              category, 
              bestseller, 
              description , 
              image ,
            firm :firm._id

        })

        const savedProduct = await product.save();

        firm.products.push(savedProduct._id)

        await firm.save()

        res.status(200).json({
        message: "Product added successfully",
        product: savedProduct
      });



    } catch (error) {
        console.error("Add product error" ,error);
        res.status(500).json({error: "Internal server error Add Product"})

    }
}

const getProductByFirm = async(req, res)=> {
    try {
        const firmId =  req.params.firmId;
        const firm =await Firm.findById(firmId);

        if(!firm) {
            return res.status(404).json({error:"No firm found"});
        }
      
       const resturantName = firm.firmName
       const products = await Product.find({ firm: firmId });
        res.status(200).json({resturantName,products});
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal server errro"})
    }
}

const deleteProductById = async(req, res) => {
    try {
        const productId = req.params.productId;

        const deleteProduct  =await Product.findByIdAndDelete(productId);

        if(deleteProduct) {
            return res.status(404).json({error: "NO product found"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal server errro"})
    }
}

module.exports = {addProduct: [upload.single('image'), addProduct],getProductByFirm, deleteProductById};
