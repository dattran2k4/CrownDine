import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    maxWidth?: string
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={cn(
                "bg-card border border-border w-full rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
                maxWidth
            )}>
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
