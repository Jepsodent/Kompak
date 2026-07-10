import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logOut } from "../auth/actions";

export default function DashboardPage() {
  return (
    <Card className="w-full max-w-lg m-auto">
      <CardHeader>
        <CardTitle className="text-center">You Are Logged In!</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={logOut}>
          <Button
            type="submit"
            variant="default"
            className="w-full cursor-pointer"
          >
            LOG OUT!
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
