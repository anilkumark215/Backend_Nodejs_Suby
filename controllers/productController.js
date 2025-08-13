const path = require("path"); // ✅ Missing import fixed
const multer = require("multer");
const Product = require("../model/Product");
const Firm = require("../model/Firm");

// ✅ Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// ✅ Add Product
const addProduct = async (req, res) => {
    try {
         const {productName, price, category, bestseller, description}  = req.body; // ✅ bestSeller fixed
        const image = req.file ? req.file.filename : undefined;

        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if (!firm) {
            return res.status(404).json({ error: "No firm found" });
        }

        const product = new Product({
            productName,
            price,
            category,
            bestseller,
            description,
            image,
            firm: firm._id
        });

        const savedProduct = await product.save();

        firm.products.push(savedProduct._id);
        await firm.save();

        return res.status(200).json({
            message: "Product added successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error("Add product error:", error);
        return res.status(500).json({ error: "Internal server error - Add Product" });
    }
};

// ✅ Get Products by Firm
const getProductByFirm = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const firm = await Firm.findById(firmId);

        if (!firm) {
            return res.status(404).json({ error: "No firm found" });
        }

        const restaurantName = firm.firmName;
        const products = await Product.find({ firm: firmId });

        return res.status(200).json({ restaurantName, products });

    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ error: "Internal server error - Get Products" });
    }
};

// ✅ Delete Product
const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "No product found" });
        }

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ error: "Internal server error - Delete Product" });
    }
};

module.exports = {
    addProduct: [upload.single("image"), addProduct],
    getProductByFirm,
    deleteProductById
};
