import { Injectable } from "@angular/core";
import { Application, Utils, isAndroid, isIOS } from "@nativescript/core";

declare const android: any;
declare const UIAlertController: any;
declare const UIAlertControllerStyle: any;

@Injectable({
  providedIn: "root",
})
export class ToastService {
  show(message: string, duration: "short" | "long" = "long") {
    if (isAndroid) {
      const context = Utils.android.getApplicationContext();
      const Toast = android.widget.Toast;
      const toastDuration =
        duration === "short" ? Toast.LENGTH_SHORT : Toast.LENGTH_LONG;

      const toast = Toast.makeText(context, message, toastDuration);
      toast.show();
    } else if (isIOS) {
      // For iOS, show a simple alert that auto-dismisses
      const alertController =
        UIAlertController.alertControllerWithTitleMessagePreferredStyle(
          null,
          message,
          UIAlertControllerStyle.Alert
        );

      const rootController = Application.ios.rootController;
      if (rootController) {
        rootController.presentViewControllerAnimatedCompletion(
          alertController,
          true,
          null
        );

        const displayTime = duration === "short" ? 1500 : 3000;
        setTimeout(() => {
          alertController.dismissViewControllerAnimatedCompletion(true, null);
        }, displayTime);
      }
    }
  }

  success(message: string) {
    this.show(message, "long");
  }

  error(message: string) {
    this.show(message, "long");
  }

  info(message: string) {
    this.show(message, "short");
  }
}
