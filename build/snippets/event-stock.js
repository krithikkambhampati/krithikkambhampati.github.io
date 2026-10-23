    const selectedVariant = registration.registrationData?.selectedVariant;
    if (registration.event.eventType === "MERCH" && selectedVariant) {
      const updateResult = await Event.updateOne(
        { _id: registration.event._id, "merchandiseVariants.name": selectedVariant, "merchandiseVariants.stock": { $gt: 0 } },
        { $inc: { "merchandiseVariants.$.stock": -1 } }
      );
      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({ message: `Variant "${selectedVariant}" is now out of stock. Cannot approve.` });
      }
    }

    // Update registration
    registration.participationStatus = "Registered";
    registration.paymentStatus = "Approved";
    await registration.save();
