const db = require('../configs/db');

const createMovement = ({
  product_id,
  serial_number = null,
  movement_type,
  quantity = 1,
  performed_by = null,
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
        performed_by,
        movement_type,
        quantity,
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
  createMovement
};