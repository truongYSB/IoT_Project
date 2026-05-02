const deviceService = require('../services/deviceService');

const deviceController = {
    // API: Điều khiển thiết bị (POST body: { device: "Fan", action: "ON" })
    control: async (req, res) => {
        try {
            const { device, action } = req.body;

            if (!device || !action) {
                return res.status(400).json({ success: false, message: "Thiếu thông tin thiết bị hoặc hành động" });
            }

            const result = await deviceService.controlDevice(device, action);

            if (result.success) {
                res.status(200).json({ success: true, message: `Đã gửi lệnh ${action} tới ${device}` });
            } else {
                res.status(500).json({ success: false, message: result.error });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = deviceController;