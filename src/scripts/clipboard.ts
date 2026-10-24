// "Copy email" for the contact block and the command palette: copies the
// address and confirms it in the toast, or shows the address if the
// browser refuses.
import { toast } from "./toast";

export async function copyEmail(email: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    toast(`Couldn't copy. The address is ${email}`);
    return false;
  }
  toast("Email copied");
  return true;
}
