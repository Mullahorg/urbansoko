import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Truck, Clock, MapPin } from "lucide-react";
import { formatKES } from "@/utils/currency";

interface ShippingCalculatorProps {
  subtotal: number;
}

const shippingData = {
  nairobi: { name: "Nairobi", cost: 0, days: "1-2" },
  mombasa: { name: "Mombasa", cost: 500, days: "2-3" },
  kisumu: { name: "Kisumu", cost: 600, days: "2-4" },
  nakuru: { name: "Nakuru", cost: 400, days: "2-3" },
  eldoret: { name: "Eldoret", cost: 700, days: "3-4" },
  thika: { name: "Thika", cost: 300, days: "1-2" },
  other: { name: "Other Regions", cost: 800, days: "3-5" },
};

export const ShippingCalculator = ({ subtotal }: ShippingCalculatorProps) => {
  const [selectedLocation, setSelectedLocation] = useState<keyof typeof shippingData | "">("");
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    if (selectedLocation) {
      setCalculated(true);
    }
  };

  const shippingInfo = selectedLocation ? shippingData[selectedLocation] : null;
  const isFreeShipping = subtotal >= 5000;
  const finalShippingCost = isFreeShipping ? 0 : (shippingInfo?.cost || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5" />
          Shipping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select your location</label>
          <Select value={selectedLocation} onValueChange={(value) => {
            setSelectedLocation(value as keyof typeof shippingData);
            setCalculated(false);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose location" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(shippingData).map(([key, data]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {data.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleCalculate} 
          disabled={!selectedLocation}
          className="w-full"
          variant="outline"
        >
          Calculate Shipping
        </Button>

        {calculated && shippingInfo && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping to:</span>
              <span className="font-medium">{shippingInfo.name}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Delivery time:
              </span>
              <span className="font-medium">{shippingInfo.days} business days</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping cost:</span>
              <div className="text-right">
                {isFreeShipping ? (
                  <div>
                    <span className="font-bold text-green-600">FREE</span>
                    <p className="text-xs text-muted-foreground">Order over {formatKES(5000)}</p>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold">{formatKES(finalShippingCost)}</span>
                    {subtotal > 0 && subtotal < 5000 && (
                      <p className="text-xs text-muted-foreground">
                        Add {formatKES(5000 - subtotal)} for free shipping
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
              <p className="font-medium">Delivery Information:</p>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• Order processing: 1 business day</li>
                <li>• Track your order with provided code</li>
                <li>• Delivery Mon-Sat, 8 AM - 6 PM</li>
              </ul>
            </div>
          </div>
        )}

        {!calculated && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-md text-sm">
            <p className="font-medium text-primary mb-1">Free Shipping Available!</p>
            <p className="text-muted-foreground text-xs">
              Orders over {formatKES(5000)} qualify for free delivery within Kenya
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
