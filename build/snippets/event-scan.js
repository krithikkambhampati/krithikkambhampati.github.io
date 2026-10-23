    const registration = await Registration.findOne({ event: eventId, ticketId }).populate("participant", "fName lName email");

    if (!registration) {
      return res.status(404).json({ message: "Invalid ticket: Registration not found for this event" });
    }

    if (registration.participationStatus === "Cancelled") {
      return res.status(400).json({ message: "Ticket invalid: Registration was cancelled" });
    }

    if (registration.paymentStatus === "Pending") {
      return res.status(400).json({ message: "Ticket invalid: Payment is pending approval" });
    }

    if (registration.attendanceMarked) {
      return res.status(400).json({
        message: "Ticket already scanned!",
        scannedAt: registration.attendedAt,
        participant: registration.participant
      });
    }

    registration.attendanceMarked = true;
    registration.attendedAt = new Date();
    registration.scannedBy = organizerId;
    await registration.save();
