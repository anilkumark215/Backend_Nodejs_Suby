const path = require('path'); // ✅ ADD THIS LINE
const Firm   = require('../model/Firm');
const Vendor = require('../model/Vendor');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() +  path.extname( file.originalname));
    }
});

const upload = multer({ storage: storage });  // ✅ ADD THIS

const addFirm = async (req, res) => {
    try {
        const { firmName, area, category, region, offer } = req.body;
        const image = req.file ? req.file.filename : undefined;

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id // ✅ Correct: _id, not _Id
        });

       const savedFirm =  await firm.save();

       vendor.firm.push(savedFirm._id)

       await vendor.save()
       console.log("Vendor updated with firm:", vendor);

        return res.status(200).json({ message: "Firm added Successfully!" });
    } catch (error) {
        console.log("error in the firmController" ,error);
        res.status(500).json("internal server error");
    }
};
const deleteFirmById = async(req, res)=>{
    
        try {
            const firmtId = req.params.firmId;
    
            const deleteProduct  =await Firm.findByIdAndDelete(firmId);
    
            if(deleteProduct) {
                return res.status(404).json({error: "NO product found"})
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({error:"Internal server errro"});
        }
    }
    

module.exports = { addFirm: [upload.single('image'), addFirm],deleteFirmById }; // ✅ FIXED
