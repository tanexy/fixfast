import { Injectable } from "@angular/core";
import { Application, AndroidApplication } from "@nativescript/core";

// Declare Android globals for TypeScript
declare var android: any;
declare var androidx: any;

@Injectable({ providedIn: "root" })
export class WifiPermissionsService {
  requestPermissions(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Application.android) {
        const permissions = [
          android.Manifest.permission.ACCESS_WIFI_STATE,
          android.Manifest.permission.ACCESS_FINE_LOCATION,
        ];

        const hasPermissions = permissions.every(
          (p: string) =>
            android.content.pm.PackageManager.PERMISSION_GRANTED ===
            androidx.core.content.ContextCompat.checkSelfPermission(
              Application.android.foregroundActivity,
              p
            )
        );

        if (hasPermissions) {
          resolve();
          return;
        }

        // Request permissions
        androidx.core.app.ActivityCompat.requestPermissions(
          Application.android.foregroundActivity,
          permissions,
          12345 // request code
        );

        // Listen for result once
        const listener = (args: any) => {
          Application.android.off(
            AndroidApplication.activityRequestPermissionsEvent,
            listener
          );

          const granted = args.grantResults.every(
            (r: number) =>
              r === android.content.pm.PackageManager.PERMISSION_GRANTED
          );

          if (granted) resolve();
          else reject();
        };

        Application.android.on(
          AndroidApplication.activityRequestPermissionsEvent,
          listener
        );
      } else {
        resolve(); // iOS / not Android
      }
    });
  }
}
