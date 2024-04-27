const User = require("../models/user.js");
const Appointment = require("../models/appointment.js");
const Prescription = require("../models/prescription.js");
const mongoose = require("mongoose");

var moment = require("moment");

const getUserCountByRole = async (req, res) => {
  //   console.log("api hit")
  try {
    var userType = req.body.userType;
    // console.log(req.body.userType);
    let users = [];
    if (userType) {
      users = await User.find({ userType: userType });
      return res.json({ count: users.length });
    } else {
      return res.status(400).json({ errors: ["User type is missing in body"] });
    }
  } catch (error) {
    return res.status(500).json({ errors: [error.message] });
  }
};

const getAppointmentCount = async (req, res) => {
  try {
    let query = {
      appointmentDate: moment(new Date()).format("YYYY-MM-DD"),
      isTimeSlotAvailable: false,
    };
    if (req.sender.doctorId) {
      query.doctorId = req.sender.doctorId;
    }
    if (req.sender.patientId) {
      query.patientId = req.sender.patientId;
    }
    let appointmentsToday = await Appointment.find(query);

    let pendingAppointmentsToday = await Appointment.find({
      ...query,
      completed: false,
    });
    // console.log(new Date().toLocaleDateString('zh-Hans-CN'));
    // console.log(appointmentsToday.length);
    return res.json({
      message: "success",
      totalAppointments: appointmentsToday.length,
      pendingAppointments: pendingAppointmentsToday.length,
    });
  } catch (error) {
    return res.status(500).json({ errors: [error.message] });
  }
};

const getPatientsTreatedCount = async (req, res) => {
  try {
    let prescriptions = await Prescription.find({}).populate({
      path: "appointmentId",
      populate: {
        path: "doctorId",
        match: { _id: mongoose.Types.ObjectId(req.sender.doctorId) },
      },
    });

    // Filter prescriptions where appointmentId has a valid doctorId
    prescriptions = prescriptions.filter(
      (prescription) => prescription.appointmentId.doctorId != null
    );

    return res.json({
      message: "success",
      treatedPatients: prescriptions.length,
    });
  } catch (error) {
    return res.status(500).json({ errors: [error.message] });
  }
};

module.exports = {
  getUserCountByRole,
  getAppointmentCount,
  getPatientsTreatedCount,
};
