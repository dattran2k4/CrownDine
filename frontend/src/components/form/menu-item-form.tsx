import React, { useState } from 'react'
import { Save, ImagePlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export interface ItemFormData {
    name: string
    description: string
    price: number
    status: string
    image: string
}

interface MenuItemFormProps {
    initialData?: ItemFormData | null
    onSubmit: (data: ItemFormData) => void
    onCancel: () => void
}

export const MenuItemForm = ({ initialData, onSubmit, onCancel }: MenuItemFormProps) => {
    const [formData, setFormData] = useState<ItemFormData>(initialData || {
        name: '',
        description: '',
        price: 0,
        status: 'AVAILABLE',
        image: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Placeholder */}
            <div className="flex justify-center mb-4">
                <div className="h-32 w-full rounded-lg bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 cursor-pointer transition-colors">
                    {formData.image ? (
                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                    ) : (
                        <>
                            <ImagePlus className="h-6 w-6 mb-2" />
                            <span className="text-xs">Upload Image</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                    id="item-name"
                    placeholder="e.g. Garlic Bread"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="item-price">Price ($)</Label>
                    <Input
                        id="item-price"
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="item-status">Status</Label>
                    <select
                        id="item-status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="SOLD_OUT">Sold Out</option>
                        <option value="HIDDEN">Hidden</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="item-description">Description</Label>
                <textarea
                    id="item-description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Item
                </Button>
            </div>
        </form>
    )
}
