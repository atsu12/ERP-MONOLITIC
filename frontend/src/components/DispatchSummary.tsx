import React from "react";

interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  serials?: string[];
}

interface DispatchSummaryProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onClearDispatch: () => void;
  onExportInvoice: () => void;
  onSubmit: () => void;
}

function DispatchSummary({
  cartItems,
  setCartItems,
  onClearDispatch,
  onExportInvoice,
  onSubmit,
}: DispatchSummaryProps) {
  const totalProducts = cartItems.length;

  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const serializedUnits = cartItems.reduce(
    (sum, item) => sum + (item.serials?.length || 0),
    0,
  );

  const isSerialized = (item: CartItem) =>
    item.serials && item.serials.length > 0;

  const removeSerial = (productIndex: number, serialToRemove: string) => {
    setCartItems((prev) =>
      prev.flatMap((item, index) => {
        if (index !== productIndex) {
          return item;
        }

        const updatedSerials = (item.serials || []).filter(
          (serial) => serial !== serialToRemove,
        );

        if (updatedSerials.length === 0) {
          return [];
        }

        return [
          {
            ...item,
            serials: updatedSerials,
            quantity: updatedSerials.length,
          },
        ];
      }),
    );
  };

  const currency = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
  });

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  return (
    <div className="erp-card erp-section mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispatch Summary</h2>

          <p className="text-sm text-gray-500 mt-1">
            Review all selected products before submitting this dispatch.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {cartItems.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>

                {isSerialized(item) ? (
                  <>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-500">Unit Price</p>
                        <p className="font-semibold">
                          {currency.format(item.unit_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Line Total</p>
                        <p className="font-bold text-lg">
                          {currency.format(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mt-3">
                      <label className="text-sm text-gray-500">Quantity</label>

                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = Math.max(1, Number(e.target.value) || 1);

                          setCartItems((prev) =>
                            prev.map((cartItem, i) =>
                              i === index
                                ? { ...cartItem, quantity: qty }
                                : cartItem,
                            ),
                          );
                        }}
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-5">
                      <div>
                        <p className="text-xs text-gray-500">Unit Price</p>
                        <p className="font-semibold">
                          {currency.format(item.unit_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Line Total</p>
                        <p className="font-bold text-lg">
                          {currency.format(item.quantity * item.unit_price)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCartItems((prev) => prev.filter((_, i) => i !== index))
                }
                className="text-red-600 hover:text-red-700 font-medium"
              >
                🗑 Remove
              </button>
            </div>

            {item.serials && item.serials.length > 0 && (
              <div className="mt-5">
                <h4 className="font-medium text-gray-700 mb-2">
                  Serial Numbers
                </h4>

                <div className="space-y-2">
                  {item.serials.map((serial) => (
                    <div
                      key={serial}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <span className="text-sm">{serial}</span>

                      <button
                        type="button"
                        onClick={() => removeSerial(index, serial)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t mt-8 pt-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500">Products</p>

            <p className="text-2xl font-bold">{totalProducts}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Units</p>

            <p className="text-2xl font-bold">{totalUnits}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Serialized Units</p>

            <p className="text-2xl font-bold">{serializedUnits}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gray-50 border border-gray-200 p-5">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Grand Total</span>

            <span className="text-3xl font-bold">
              {currency.format(grandTotal)}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onClearDispatch}
            className="px-5 py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
          >
            Clear Dispatch
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExportInvoice}
              className="px-6 py-3 rounded-2xl border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Export Invoice
            </button>

            <button
              onClick={onSubmit}
              className="px-6 py-3 rounded-2xl bg-black text-white hover:bg-gray-800"
            >
              Submit for Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DispatchSummary;
