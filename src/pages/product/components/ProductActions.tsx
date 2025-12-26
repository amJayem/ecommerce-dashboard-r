import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { type NavigateFunction } from "react-router-dom";

interface ProductActionsProps {
  isEditMode: boolean;
  createProductLoading: boolean;
  updateProductLoading: boolean;
  isLoadingProduct: boolean;
  navigate: NavigateFunction;
  submitAction: "stay" | "exit";
  setSubmitAction: (action: "stay" | "exit") => void;
}

export function ProductActions({
  isEditMode,
  createProductLoading,
  updateProductLoading,
  isLoadingProduct,
  navigate,
  submitAction,
  setSubmitAction,
}: ProductActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/products")}
      >
        Cancel
      </Button>

      {isEditMode ? (
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={updateProductLoading || isLoadingProduct}
            onClick={() => setSubmitAction("stay")}
          >
            {updateProductLoading && submitAction === "stay" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update
              </>
            )}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={updateProductLoading || isLoadingProduct}
            onClick={() => setSubmitAction("exit")}
          >
            {updateProductLoading && submitAction === "exit" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update & Go to List
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={createProductLoading}
          onClick={() => setSubmitAction("exit")}
        >
          {createProductLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Product
            </>
          )}
        </Button>
      )}
    </div>
  );
}
