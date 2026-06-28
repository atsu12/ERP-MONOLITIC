import {
  Component,
  ErrorInfo,
  ReactNode
} from "react";

import {
  AlertTriangle,
  RefreshCcw
} from "lucide-react";

interface Props {

  children: ReactNode;

}

interface State {

  hasError: boolean;

}

class ErrorBoundary
  extends Component<Props, State> {

  constructor(props: Props) {

    super(props);

    this.state = {

      hasError: false,

    };

  }

  static getDerivedStateFromError() {

    return {

      hasError: true,

    };

  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo
  ) {

    console.error(
      "ERP UI Error:",
      error,
      errorInfo
    );

  }

  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 text-center max-w-xl w-full">

            {/* ICON */}

            <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6">

              <AlertTriangle
                size={42}
                className="text-red-700"
              />

            </div>

            {/* TITLE */}

            <h1 className="text-3xl font-black text-gray-900 mb-4">

              ERP Interface Error

            </h1>

            {/* DESCRIPTION */}

            <p className="text-gray-500 mb-8">

              An unexpected interface error occurred while rendering the application.

            </p>

            {/* BUTTON */}

            <button
              onClick={() =>
                window.location.reload()
              }
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
            >

              <RefreshCcw size={18} />

              Reload Application

            </button>

          </div>

        </div>

      );

    }

    return this.props.children;

  }

}

export default ErrorBoundary;
