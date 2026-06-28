import {
  motion,
  AnimatePresence
} from "framer-motion";

import {
  AlertTriangle
} from "lucide-react";

interface ConfirmModalProps {

  open: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm: () => void;

  onCancel: () => void;

  loading?: boolean;

}

function ConfirmModal({

  open,

  title,

  message,

  confirmText = "Confirm",

  cancelText = "Cancel",

  onConfirm,

  onCancel,

  loading = false,

}: ConfirmModalProps) {

  return (

    <AnimatePresence>

      {open && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 40,
            }}
            transition={{
              duration: 0.2,
            }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >

            {/* HEADER */}

            <div className="px-8 pt-8">

              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">

                <AlertTriangle
                  size={32}
                  className="text-red-600"
                />

              </div>

              <h2 className="text-3xl font-black text-gray-900">

                {title}

              </h2>

              <p className="text-gray-500 mt-4 leading-relaxed">

                {message}

              </p>

            </div>

            {/* FOOTER */}

            <div className="flex gap-4 px-8 py-8 mt-4">

              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl border border-gray-300 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
              >

                {cancelText}

              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg transition disabled:opacity-50"
              >

                {loading
                  ? "Processing..."
                  : confirmText}

              </button>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  );

}

export default ConfirmModal;
