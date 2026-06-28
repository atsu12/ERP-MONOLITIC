const db = require('../configs/db');

const createSerializedMovement = ({
  product_id,
  serial_number,
  movement_type,
  user_id,
  reference = null
}) => {

  return new Promise((resolve, reject) => {

    const q = `
      INSERT INTO stock_movements
      (
        product_id,
        serial_number,
        user_id,
        type,
        quantity,
        reference
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      q,
      [
        product_id,
        serial_number,
        user_id,
        movement_type,
        1,
        reference
      ],
      (err, result) => {

        if (err) {
          return reject(err);
        }

        resolve(result);

      }
    );

  });

};

module.exports = {
  createSerializedMovement
};
