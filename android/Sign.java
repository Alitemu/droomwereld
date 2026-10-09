import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;

import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Collections;

/**
 * Ondertekent de APK (handtekeningschema v2) met Google's apksig-bibliotheek en controleert hem daarna.
 * Gebruik: java -cp apksig.jar:. Sign <keystore.p12> <wachtwoord> <in.apk> <uit.apk>
 */
public class Sign {
    public static void main(String[] a) throws Exception {
        char[] pw = a[1].toCharArray();
        KeyStore ks = KeyStore.getInstance("PKCS12");
        try (FileInputStream in = new FileInputStream(a[0])) { ks.load(in, pw); }
        String alias = ks.aliases().nextElement();
        PrivateKey key = (PrivateKey) ks.getKey(alias, pw);
        X509Certificate cert = (X509Certificate) ks.getCertificate(alias);

        ApkSigner.SignerConfig signer = new ApkSigner.SignerConfig.Builder("droomwereld", key, Collections.singletonList(cert)).build();
        new ApkSigner.Builder(Collections.singletonList(signer))
            .setInputApk(new File(a[2])).setOutputApk(new File(a[3]))
            .setV1SigningEnabled(false).setV2SigningEnabled(true) // v2 is genoeg vanaf Android 7 (minSdk 24); v1 werkt niet met apksig 2.3.0 op Java 17+
            .build().sign();

        ApkVerifier.Result r = new ApkVerifier.Builder(new File(a[3])).build().verify();
        System.out.println("verified=" + r.isVerified() + " v1=" + r.isVerifiedUsingV1Scheme() + " v2=" + r.isVerifiedUsingV2Scheme());
        for (Object e : r.getErrors()) System.out.println("ERROR " + e);
        for (Object w : r.getWarnings()) System.out.println("WARN " + w);
        if (!r.isVerified()) System.exit(1);
    }
}
