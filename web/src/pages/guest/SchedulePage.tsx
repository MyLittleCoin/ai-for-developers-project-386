import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/PageHeader";
import BookingsTable from "@/components/admin/BookingsTable";
import { useSchedule } from "@/features/guest/useSchedule";

export default function SchedulePage() {
  const { data, isLoading, isError } = useSchedule();

  return (
    <div>
      <PageHeader
        title="Расписание"
        description="Предстоящие встречи, запланированные гостем"
      />
      {isLoading && <Skeleton className="h-48" />}
      {isError && <p className="text-destructive">Ошибка сервера</p>}
      {data && data.length === 0 && (
        <p className="text-muted-foreground">Ближайших встреч нет</p>
      )}
      {data && data.length > 0 && <BookingsTable bookings={data} />}
    </div>
  );
}
