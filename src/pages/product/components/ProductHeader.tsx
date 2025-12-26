import { Button } from "@/components/ui/button";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductHeaderProps {
  isEditMode: boolean;
}

export function ProductHeader({ isEditMode }: ProductHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="pl-0 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update product details and manage inventory."
            : "Create a new product by adding the essential details."}
        </p>
      </div>
      {!isEditMode && (
        <div className="hidden sm:block">
          <PackagePlus className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
