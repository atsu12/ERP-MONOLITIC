import Modal from "./Modal";

type Props = {
  dispatch: any;
  items: any[];
  onClose: () => void;
  onComplete: () => void;
};

function DispatchDetailsModal({
  dispatch,
  items,
  onClose,
  onComplete,
}: Props) {
  return (
    <Modal title={dispatch.reference} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Customer</p>

            <p className="font-semibold">
              {dispatch.customer_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Contact Person
            </p>

            <p className="font-semibold">
              {dispatch.contact_person || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Contact</p>

            <p className="font-semibold">
              {dispatch.contact || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>

            <p className="font-semibold">
              {dispatch.location || "-"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-3">
            Products
          </h3>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-2xl p-4"
              >
                <p className="font-semibold">
                  {item.name}
                </p>

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Quantity:</span>{" "}
                    {item.quantity}
                  </p>

                  <p>
                    <span className="font-semibold">Unit Price:</span>{" "}
                    {dispatch.currency} {item.unit_price}
                  </p>

                  <p>
                    <span className="font-semibold">Subtotal:</span>{" "}
                    {dispatch.currency} {item.line_total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Items</span>

            <span className="font-semibold">
              {items.reduce(
                (sum, item) => sum + Number(item.quantity),
                0
              )}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Grand Total</span>

            <span>
              {dispatch.currency} {dispatch.grand_total}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border"
          >
            Close
          </button>

          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium"
          >
            Complete Dispatch
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DispatchDetailsModal;
