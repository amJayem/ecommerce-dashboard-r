import { Button } from "@/components/ui/button";
import { ArrowLeft, PackagePlus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProductStorefrontUrl } from "@/lib/constants";

interface ProductHeaderProps {
  isEditMode: boolean;
  productId?: number;
  productName?: string;
}

export function ProductHeader({
  isEditMode,
  productId,
  productName,
}: ProductHeaderProps) {
  const navigate = useNavigate();
  const storefrontUrl = productId ? getProductStorefrontUrl(productId) : null;

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        variant="ghost"
        size="sm"
        className="pl-0 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="space-y-2">
        {isEditMode && storefrontUrl && productName ? (
          <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-3xl font-bold tracking-tight hover:text-primary transition-colors"
          >
            {productName}
            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>
        )}
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
