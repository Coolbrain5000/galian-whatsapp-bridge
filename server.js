require("dotenv").config();

const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3100;
const GOWA_URL = process.env.GOWA_URL || "http://localhost:3000";
const DEVICE_ID = process.env.GOWA_DEVICE_ID || "galian-solar";
const GROUP_JID = process.env.WHATSAPP_GROUP_JID;

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "GalianWatts WhatsApp Bridge",
        gowa: GOWA_URL,
        device: DEVICE_ID
    });
});

app.post("/send-ticket", async (req, res) => {
    try {
        const {
            jira_id,
            priority,
            customer,
            phone,
            location,
            system,
            issue,
            engineer
        } = req.body;

        if (!jira_id || !customer || !phone || !issue) {
            return res.status(400).json({
                success: false,
                error: "jira_id, customer, phone and issue are required"
            });
        }

        const message =
`🔷 GALIAN WATTS · SERVICE DESK

🎫 ${jira_id} · ${priority || "NORMAL"}

👤 ${customer}
📞 ${phone}
📍 ${location || "-"} · ${system || "-"}

⚠️ ${issue}

👨‍🔧 ${engineer || "Unassigned"}`;

        const response = await fetch(`${GOWA_URL}/send/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Device-Id": DEVICE_ID
            },
            body: JSON.stringify({
                phone: GROUP_JID,
                message
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                gowa: result
            });
        }

        res.json({
            success: true,
            message: "Service ticket sent to GALIANWATTS-ENGINEERS",
            jira_id,
            gowa: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`GalianWatts WhatsApp Bridge running on http://localhost:${PORT}`);
});