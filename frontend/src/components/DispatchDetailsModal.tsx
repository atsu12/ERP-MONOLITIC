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

                <p className="text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
            ))}
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
