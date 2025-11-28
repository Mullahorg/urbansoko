import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, Star } from 'lucide-react';

interface TestimonialItem {
  name: string;
  initials: string;
  role: string;
  comment: string;
  rating: number;
}

interface AdminContentTestimonialsProps {
  testimonials: TestimonialItem[];
  onChange: (testimonials: TestimonialItem[]) => void;
  onSave: () => void;
  saving: boolean;
}

const AdminContentTestimonials = ({ testimonials, onChange, onSave, saving }: AdminContentTestimonialsProps) => {
  const addTestimonial = () => {
    onChange([
      ...testimonials,
      { name: 'Customer Name', initials: 'CN', role: 'Verified Customer', comment: 'Great product!', rating: 5 }
    ]);
  };

  const removeTestimonial = (index: number) => {
    onChange(testimonials.filter((_, i) => i !== index));
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string | number) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-generate initials from name
    if (field === 'name') {
      const names = (value as string).split(' ');
      updated[index].initials = names.map(n => n[0]?.toUpperCase() || '').join('').slice(0, 2);
    }
    
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>Customer reviews displayed on the homepage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testimonials?.map((testimonial, idx) => (
          <div key={idx} className="p-4 border rounded-lg space-y-3 relative">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Testimonial {idx + 1}</h4>
              {testimonials.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeTestimonial(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={testimonial.name}
                  onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Initials</Label>
                <Input
                  value={testimonial.initials}
                  onChange={(e) => updateTestimonial(idx, 'initials', e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Role/Title</Label>
                <Input
                  value={testimonial.role}
                  onChange={(e) => updateTestimonial(idx, 'role', e.target.value)}
                  placeholder="Verified Customer"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateTestimonial(idx, 'rating', star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-6 w-6 ${star <= testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={testimonial.comment}
                onChange={(e) => updateTestimonial(idx, 'comment', e.target.value)}
                rows={2}
                placeholder="Customer's review..."
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <Button variant="outline" onClick={addTestimonial}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Testimonials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContentTestimonials;
