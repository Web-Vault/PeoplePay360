const service = require('../services/attendanceService');
exports.checkIn = async (req, res, next) => { try { res.status(201).json({ success: true, data: { attendance: await service.checkIn(req.user._id, req.body.at) } }); } catch (error) { next(error); } };
exports.checkOut = async (req, res, next) => { try { res.json({ success: true, data: { attendance: await service.checkOut(req.user._id, req.body.at) } }); } catch (error) { next(error); } };
exports.mine = async (req, res, next) => { try { res.json({ success: true, data: { attendance: await service.mine(req.user._id, req.query.from, req.query.to) } }); } catch (error) { next(error); } };
exports.list = async (req, res, next) => { try { res.json({ success: true, data: { attendance: await service.list(req.query) } }); } catch (error) { next(error); } };
exports.today = async (req, res, next) => { try { res.json({ success: true, data: await service.today(req.user._id) }); } catch (error) { next(error); } };
exports.chooseOvertime = async (req, res, next) => { try { res.json({ success: true, data: { attendance: await service.chooseOvertime(req.user._id, req.body.date, req.body.choice) } }); } catch (error) { next(error); } };
