interface ExplanationItemProps {
  title: string
  text: string
}

export function ExplanationItem({ title, text }: ExplanationItemProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
  )
}
