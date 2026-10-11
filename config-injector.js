import fs from 'fs-extra';
import path from 'path';

export async function injectUserConfigs(extractedPath, configs) {
    console.log("\n⚙️ Configurations aur Assets inject kiye ja rahe hain...");

    const mipmapPaths = [
        'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
        'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png'
    ];

    if (configs.logoPath && fs.existsSync(configs.logoPath)) {
        mipmapPaths.forEach(mPath => {
            const fullTarget = path.join(extractedPath, mPath);
            if (fs.existsSync(path.dirname(fullTarget))) {
                fs.copySync(configs.logoPath, fullTarget);
            }
        });
        console.log("🖼️ App Assets (PNG Icons) updated successfully.");
    }

    const manifestPath = path.join(extractedPath, 'android/app/src/main/AndroidManifest.xml');
    if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf8');

        if (configs.admobAppId) {
            const admobMeta = `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${configs.admobAppId}"/>`;
            manifest = manifest.replace('</application>', `    ${admobMeta}\n    </application>`);
        }

        if (configs.metaAppId) {
            const metaApp = `<meta-data android:name="com.facebook.sdk.ApplicationId" android:value="fb${configs.metaAppId}"/>`;
            manifest = manifest.replace('</application>', `    ${metaApp}\n    </application>`);
        }

        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log("📝 AndroidManifest.xml updated with AdMob and Meta IDs.");
    }

    const stringsPath = path.join(extractedPath, 'android/app/src/main/res/values/strings.xml');
    if (fs.existsSync(stringsPath)) {
        let stringsContent = fs.readFileSync(stringsPath, 'utf8');

        let dynamicStrings = '';
        if (configs.agoraAppId) dynamicStrings += `\n    <string name="agora_app_id">${configs.agoraAppId}</string>`;
        if (configs.admobBannerId) dynamicStrings += `\n    <string name="admob_banner_id">${configs.admobBannerId}</string>`;
        
        stringsContent = stringsContent.replace('</resources>', `${dynamicStrings}\n</resources>`);
        fs.writeFileSync(stringsPath, stringsContent, 'utf8');
        console.log("💎 Strings configuration injected successfully.");
    }
}
