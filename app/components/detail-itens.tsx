// Item de Informação
export function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode | null;
}) {
  return (
    <div className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-medium">
          {value || (
            <span className="text-sm text-muted-foreground">Não informado</span>
          )}
        </p>
      </div>
    </div>
  );
}

// Item de Sumário (para textos longos)
export function SumarioItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <h4 className="text-base font-semibold mb-1">{label}</h4>
      <p className="text-muted-foreground">
        {value || (
          <span className="text-sm text-muted-foreground">
            Nenhuma informação.
          </span>
        )}
      </p>
    </div>
  );
}
