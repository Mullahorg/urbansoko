import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal = ({ isOpen, onClose, category }: SizeGuideModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Size Guide
          </DialogTitle>
          <DialogDescription>
            Find your perfect fit with our comprehensive size guide
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Measurements */}
          <div>
            <h3 className="font-semibold text-lg mb-3">How to Measure</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Chest:</p>
                <p className="text-muted-foreground">Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Waist:</p>
                <p className="text-muted-foreground">Measure around your natural waistline, keeping the tape comfortably loose.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Hip:</p>
                <p className="text-muted-foreground">Measure around the fullest part of your hips, about 8 inches below your waist.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Length:</p>
                <p className="text-muted-foreground">Measure from the highest point of the shoulder to the desired length.</p>
              </div>
            </div>
          </div>

          {/* Size Chart for Shirts/Tops */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Standard Size Chart (cm)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left font-semibold">Size</th>
                    <th className="border border-border p-3 text-left font-semibold">Chest</th>
                    <th className="border border-border p-3 text-left font-semibold">Waist</th>
                    <th className="border border-border p-3 text-left font-semibold">Hip</th>
                    <th className="border border-border p-3 text-left font-semibold">Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">S</td>
                    <td className="border border-border p-3">88-92</td>
                    <td className="border border-border p-3">78-82</td>
                    <td className="border border-border p-3">88-92</td>
                    <td className="border border-border p-3">68</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">M</td>
                    <td className="border border-border p-3">96-100</td>
                    <td className="border border-border p-3">86-90</td>
                    <td className="border border-border p-3">96-100</td>
                    <td className="border border-border p-3">70</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">L</td>
                    <td className="border border-border p-3">104-108</td>
                    <td className="border border-border p-3">94-98</td>
                    <td className="border border-border p-3">104-108</td>
                    <td className="border border-border p-3">72</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">XL</td>
                    <td className="border border-border p-3">112-116</td>
                    <td className="border border-border p-3">102-106</td>
                    <td className="border border-border p-3">112-116</td>
                    <td className="border border-border p-3">74</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">XXL</td>
                    <td className="border border-border p-3">120-124</td>
                    <td className="border border-border p-3">110-114</td>
                    <td className="border border-border p-3">120-124</td>
                    <td className="border border-border p-3">76</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fit Tips */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Fit Tips</h3>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>If you're between sizes, we recommend sizing up for a more comfortable fit</li>
              <li>Traditional African wear typically has a relaxed, comfortable fit</li>
              <li>Check the specific product description for fit notes</li>
              <li>Contact us if you need help choosing the right size</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
