import express from 'express';
const router = express.Router();
import ObjectId from 'mongodb';


router.get("/", async (req, res) => {
    const { videoCollection } = req.db;
    try {
        const videos = await videoCollection.find().toArray();
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

router.get("/api/videos", async (req, res) => {
    const { videoCollection } = req.db;
    try {
        const videos = await videoCollection.find().toArray();
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

router.put("/api/videos/:id", async (req, res) => {
    const { videoCollection } = req.db;
    const { id } = req.params;

    try {
        const allowedFields = ["title", "description", "src", "image", "category", "author"];
        const updateData = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        );

        const result = await videoCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: updateData},

    );
        console.log("🔧 Update payload:", updateData);
        console.log("🆔 Target video:", id);
        console.log("📊 MongoDB result:", result);

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No such video" });
        }
        res.json({ message: "Video updated successfully.", modifiedCount: result.matchedCount });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch videos" });
    }

});

router.get("/api/videos/by-author", async (req, res) => {
    const { videoCollection } = req.db;

    try {
        const pipeline = [
            {
                $group: {
                    _id: "$author",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ];

        const stats = await videoCollection.aggregate(pipeline).toArray();
        res.json(stats);
    } catch (err) {
        console.error(" Aggregation failed:", err);
        res.status(500).json({ error: "Failed to aggregate videos by author" });
    }
});




module.exports = router;
