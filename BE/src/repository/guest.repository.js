import db from "../models/index.cjs";

const { Guest } = db;

class GuestRepository {
  async findOrCreate(guestId, transaction, email = null) {
    const [guest] = await Guest.findOrCreate({
      where: { guestId: guestId },
      defaults: { email: email },
      transaction: transaction,
    });

  
    if (!guest.isNewRecord && email && guest.email !== email) {
      await guest.update({ email: email }, { transaction: transaction });
    }

    return guest.toJSON();
  }

  async findById(guestId) {
    const guest = await Guest.findOne({
      where: { guestId: guestId },
    });
    return guest ? guest.toJSON() : null;
  }
}

export default GuestRepository;
