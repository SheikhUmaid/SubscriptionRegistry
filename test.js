const codes = [
    `import java.util.*;

public class CaesarCipher {

    public static String encrypt(String text, int shift) {
        StringBuilder result = new StringBuilder();

        for (char ch : text.toCharArray()) {
            if (Character.isUpperCase(ch)) {
                char c = (char) ((ch - 'A' + shift) % 26 + 'A');
                result.append(c);
            } else if (Character.isLowerCase(ch)) {
                char c = (char) ((ch - 'a' + shift) % 26 + 'a');
                result.append(c);
            } else {
                result.append(ch);
            }
        }
        return result.toString();
    }

    public static String decrypt(String text, int shift) {
        return encrypt(text, 26 - (shift % 26));
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter the message: ");
        String message = sc.nextLine();

        System.out.print("Enter the shift value: ");
        int shift = sc.nextInt();

        String encrypted = encrypt(message, shift);
        String decrypted = decrypt(encrypted, shift);

        System.out.println("\nEncrypted message: " + encrypted);
        System.out.println("Decrypted message: " + decrypted);

        sc.close();
    }
}`,
    `import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Scanner;

public class CaesarCipherFile {

    public static String encrypt(String text, int shift) {
        String result = "";

        for (char ch : text.toCharArray()) {
            if (Character.isUpperCase(ch)) {
                char c = (char) ((ch - 'A' + shift) % 26 + 'A');
                result = result + c;
            } else if (Character.isLowerCase(ch)) {
                char c = (char) ((ch - 'a' + shift) % 26 + 'a');
                result = result + c;
            } else {
                result = result + ch;
            }
        }
        return result;
    }

    public static String decrypt(String text, int shift) {
        String result = "";

        for (char ch : text.toCharArray()) {
            if (Character.isUpperCase(ch)) {
                char c = (char) ((ch - 'A' - shift + 26) % 26 + 'A');
                result = result + c;
            } else if (Character.isLowerCase(ch)) {
                char c = (char) ((ch - 'a' - shift + 26) % 26 + 'a');
                result = result + c;
            } else {
                result = result + ch;
            }
        }
        return result;
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        while (true) {

            System.out.println("\n--- CAESAR CIPHER USING FILE ---");
            System.out.println("1. Encrypt File");
            System.out.println("2. Decrypt File");
            System.out.println("3. Exit");
            System.out.print("Enter your choice: ");

            int choice = sc.nextInt();
            sc.nextLine();

            if (choice == 3) {
                System.out.println("Program exited.");
                break;
            }

            if (choice == 1 || choice == 2) {

                System.out.print("Enter input file name: ");
                String inputFile = sc.nextLine();

                System.out.print("Enter output file name: ");
                String outputFile = sc.nextLine();

                System.out.print("Enter shift value: ");
                int shift = sc.nextInt();
                sc.nextLine();

                try {

                    FileInputStream input = new FileInputStream(inputFile);

                    String text = "";
                    int data;

                    while ((data = input.read()) != -1) {
                        text = text + (char) data;
                    }

                    input.close();

                    String result;

                    if (choice == 1) {
                        result = encrypt(text, shift);
                        
                        `,
    `import java.util.*;

public class Playfair_Cipher {

    static char[][] matrix = new char[5][5];

    static void generateMatrix(String key) {
        key = key.toUpperCase().replaceAll("[^A-Z]", "").replace('J', 'I');

        StringBuilder sb = new StringBuilder();
        boolean[] used = new boolean[26];

        for (char c : key.toCharArray()) {
            if (!used[c - 'A']) {
                sb.append(c);
                used[c - 'A'] = true;
            }
        }

        for (char c = 'A'; c <= 'Z'; c++) {
            if (c == 'J') continue;
            if (!used[c - 'A']) {
                sb.append(c);
                used[c - 'A'] = true;
            }
        }

        int k = 0;
        for (int i = 0; i < 5; i++)
            for (int j = 0; j < 5; j++)
                matrix[i][j] = sb.charAt(k++);
    }

    static int[] findPosition(char c) {
        if (c == 'J') c = 'I';

        for (int i = 0; i < 5; i++)
            for (int j = 0; j < 5; j++)
                if (matrix[i][j] == c)
                    return new int[]{i, j};

        return null;
    }

    static String prepareText(String text) {
        text = text.toUpperCase().replaceAll("[^A-Z]", "").replace('J', 'I');

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i++) {
            char a = text.charAt(i);

            if (i + 1 < text.length()) {
                char b = text.charAt(i + 1);

                if (a == b) {
                    result.append(a).append('X');
                } else {
                    result.append(a).append(b);
                    i++;
                }
            } else {
                result.append(a).append('X');
            }
        }

        return result.toString();
    }

    static String processPair(char a, char b, boolean encrypt) {
        int[] p1 = findPosition(a);
        int[] p2 = findPosition(b);

        int r1 = p1[0], c1 = p1[1];
        int r2 = p2[0], c2 = p2[1];

        int shift = encrypt ? 1 : 4;

        if (r1 == r2) {
            return "" + matrix[r1][(c1 + shift) % 5]
                    + matrix[r2][(c2 + shift) % 5];
        } else if (c1 == c2) {
            return "" + matrix[(r1 + shift) % 5][c1]
                    + matrix[(r2 + shift) % 5][c2];
        } else {
            return "" + matrix[r1][c2]
                    + matrix[r2][c1];
        }
    }

    static String encrypt(String plaintext) {
        String prepared = prepareText(plaintext);

        StringBuilder cipher = new StringBuilder();

        for (int i = 0; i < prepared.length(); i += 2)
            cipher.append(processPair(prepared.charAt(i),
                    prepared.charAt(i + 1), true));

        return cipher.toString();
    }

    static String removeFillers(String text) {
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i++) {
            if (i > 0 && i < text.length() - 1 &&
                    text.charAt(i) == 'X' &&
                    text.charAt(i - 1) == text.charAt(i + 1))
                continue;

            result.append(text.charAt(i));
        }

        if (result.length() > 0 &&
                result.charAt(result.length() - 1) == 'X')
            result.deleteCharAt(result.length() - 1);

        return result.toString();
    }

    static String decrypt(String ciphertext) {
        ciphertext = ciphertext.toUpperCase()
                .replaceAll("[^A-Z]", "")
                .replace('J', 'I');

        StringBuilder plain = new StringBuilder();

        for (int i = 0; i < ciphertext.length(); i += 2)
            plain.append(processPair(ciphertext.charAt(i),
                    ciphertext.charAt(i + 1), false));

        return removeFillers(plain.toString());
    }

    static void displayMatrix() {
        System.out.println("\nPlayfair Matrix:");

        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++)
                System.out.print(matrix[i][j] + " ");
            System.out.println();
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Key: ");
        String key = sc.nextLine();

        generateMatrix(key);
        displayMatrix();

        System.out.print("\nEnter plaintext: ");
        String plaintext = sc.nextLine();

        String ciphertext = encrypt(plaintext);
        System.out.println("Encrypted text: " + ciphertext);

        String decrypted = decrypt(ciphertext);
        System.out.println("Decrypted text: " + decrypted);

        sc.close();
    }
}`,

    `import java.util.*;

public class ColumnarTranspositionCipher {

    static int[] getOrder(String key) {
        int[] order = new int[key.length()];
        for (int i = 0; i < order.length; i++)
            order[i] = i;

        for (int i = 0; i < order.length - 1; i++)
            for (int j = i + 1; j < order.length; j++)
                if (key.charAt(order[i]) > key.charAt(order[j])) {
                    int temp = order[i];
                    order[i] = order[j];
                    order[j] = temp;
                }
        return order;
    }

    static String encrypt(String text, String key) {
        int cols = key.length();
        int rows = (text.length() + cols - 1) / cols;
        char[][] matrix = new char[rows][cols];
        int index = 0;

        for (int row = 0; row < rows; row++)
            for (int col = 0; col < cols; col++)
                matrix[row][col] = index < text.length() ? text.charAt(index++) : 'X';

        StringBuilder result = new StringBuilder();
        for (int col : getOrder(key))
            for (int row = 0; row < rows; row++)
                result.append(matrix[row][col]);

        return result.toString();
    }

    static String decrypt(String cipher, String key) {
        int cols = key.length();
        int rows = cipher.length() / cols;
        char[][] matrix = new char[rows][cols];
        int index = 0;

        for (int col : getOrder(key))
            for (int row = 0; row < rows; row++)
                matrix[row][col] = cipher.charAt(index++);

        StringBuilder result = new StringBuilder();
        for (char[] row : matrix)
            for (char ch : row)
                result.append(ch);

        return result.toString().replaceAll("X+$", "");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter Key: ");
        String key = scanner.nextLine().toUpperCase();

        System.out.print("Enter Plaintext: ");
        String plaintext = scanner.nextLine().toUpperCase().replaceAll("\\s+", "");

        String cipher = encrypt(plaintext, key);

        System.out.println("Encrypted Text: " + cipher);
        System.out.println("Decrypted Text: " + decrypt(cipher, key));

        scanner.close();
    }
}`,

    `import java.util.Scanner;

public class VigenereCipher {

    static String encrypt(String text, String key) {
        StringBuilder result = new StringBuilder();
        text = text.toUpperCase();
        key = key.toUpperCase();

        int j = 0;

        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);

            if (Character.isLetter(ch)) {
                char c = (char) ((ch - 'A' + key.charAt(j) - 'A') % 26 + 'A');
                result.append(c);
                j = (j + 1) % key.length();
            } else {
                result.append(ch);
            }
        }
        return result.toString();
    }

    static String decrypt(String text, String key) {
        StringBuilder result = new StringBuilder();
        text = text.toUpperCase();
        key = key.toUpperCase();

        int j = 0;

        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);

            if (Character.isLetter(ch)) {
                char c = (char) ((ch - key.charAt(j) + 26) % 26 + 'A');
                result.append(c);
                j = (j + 1) % key.length();
            } else {
                result.append(ch);
            }
        }
        return result.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String plain = sc.nextLine();

        System.out.print("Enter Key: ");
        String key = sc.nextLine();

        String cipher = encrypt(plain, key);
        System.out.println("Encrypted Text: " + cipher);

        String decrypted = decrypt(cipher, key);
        System.out.println("Decrypted Text: " + decrypted);

        sc.close();
    }
}`, `import java.util.*;

public class RailFenceCipher {

    static String encrypt(String text, int rails) {
        if (rails <= 1) return text;

        StringBuilder[] f = new StringBuilder[rails];
        for (int i = 0; i < rails; i++) f[i] = new StringBuilder();

        int row = 0, dir = 1;
        for (char ch : text.toCharArray()) {
            f[row].append(ch);
            if (row == 0) dir = 1;
            else if (row == rails - 1) dir = -1;
            row += dir;
        }

        StringBuilder res = new StringBuilder();
        for (StringBuilder s : f) res.append(s);
        return res.toString();
    }

    static String decrypt(String c, int rails) {
        if (rails <= 1) return c;

        boolean[][] p = new boolean[rails][c.length()];
        char[] res = new char[c.length()];

        int row = 0, dir = 1;
        for (int i = 0; i < c.length(); i++) {
            p[row][i] = true;
            if (row == 0) dir = 1;
            else if (row == rails - 1) dir = -1;
            row += dir;
        }

        int k = 0;
        for (int i = 0; i < rails; i++)
            for (int j = 0; j < c.length(); j++)
                if (p[i][j]) res[j] = c.charAt(k++);

        return new String(res);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter text: ");
        String text = sc.nextLine();
        System.out.print("Enter rails: ");
        int rails = sc.nextInt();

        String enc = encrypt(text, rails);
        System.out.println("Encrypted: " + enc);
        System.out.println("Decrypted: " + decrypt(enc, rails));
    }
}`, `import java.util.Scanner;

public class HillCipher2 {

    static int modInverse(int a, int m) {
        a = a % m;

        for (int x = 1; x < m; x++) {
            if ((a * x) % m == 1)
                return x;
        }

        return -1;
    }

    static String encrypt(String text, int[][] key) {
        text = text.toUpperCase().replaceAll("[^A-Z]", "");

        if (text.length() % 2 != 0)
            text += "X";

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i += 2) {
            int a = text.charAt(i) - 'A';
            int b = text.charAt(i + 1) - 'A';

            int x = (key[0][0] * a + key[0][1] * b) % 26;
            int y = (key[1][0] * a + key[1][1] * b) % 26;

            result.append((char) (x + 'A'));
            result.append((char) (y + 'A'));
        }

        return result.toString();
    }

    static String decrypt(String text, int[][] key) {
        int a = key[0][0];
        int b = key[0][1];
        int c = key[1][0];
        int d = key[1][1];

        int determinant = (a * d - b * c) % 26;
        if (determinant < 0)
            determinant += 26;

        int inverse = modInverse(determinant, 26);

        if (inverse == -1)
            return "Invalid Key";

        int[][] inverseKey = {
                {(d * inverse) % 26, (-b * inverse + 26) % 26},
                {(-c * inverse + 26) % 26, (a * inverse) % 26}
        };

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i += 2) {
            int x = text.charAt(i) - 'A';
            int y = text.charAt(i + 1) - 'A';

            int p = (inverseKey[0][0] * x + inverseKey[0][1] * y) % 26;
            int q = (inverseKey[1][0] * x + inverseKey[1][1] * y) % 26;

            result.append((char) (p + 'A'));
            result.append((char) (q + 'A'));
        }

        return result.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int[][] key = new int[2][2];

        System.out.println("Enter 2x2 Key Matrix:");

        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                key[i][j] = sc.nextInt();
            }
        }

        sc.nextLine();

        System.out.print("Enter Plaintext: ");
        String plaintext = sc.nextLine();

        String encrypted = encrypt(plaintext, key);

        System.out.println("Encrypted Text: " + encrypted);
        System.out.println("Decrypted Text: " + decrypt(encrypted, key));

        sc.close();
    }
}`,
    `import java.util.Scanner;

public class PermutationCipher {

    static String encrypt(String text, int[] key) {
        int n = key.length;
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i += n) {
            int len = Math.min(n, text.length() - i);
            String block = text.substring(i, i + len);

            for (int k : key) {
                if (k <= len)
                    result.append(block.charAt(k - 1));
            }
        }
        return result.toString();
    }

    static String decrypt(String text, int[] key) {
        int n = key.length;
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i += n) {
            int len = Math.min(n, text.length() - i);
            String block = text.substring(i, i + len);
            char[] original = new char[len];

            int j = 0;

            for (int k : key) {
                if (k <= len) {
                    original[k - 1] = block.charAt(j);
                    j++;
                }
            }

            result.append(new String(original));
        }

        return result.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter plaintext: ");
        String plaintext = sc.nextLine();

        System.out.print("Enter permutation size: ");
        int n = sc.nextInt();

        int[] key = new int[n];

        System.out.println("Enter permutation Key:");
        for (int i = 0; i < n; i++)
            key[i] = sc.nextInt();

        String encrypted = encrypt(plaintext, key);
        String decrypted = decrypt(encrypted, key);

        System.out.println("Encrypted text: " + encrypted);
        System.out.println("Decrypted text: " + decrypted);

        sc.close();
    }
}`,
    `import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

public class DESCipher {

    public static void main(String[] args) throws Exception {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String text = sc.nextLine();

        System.out.print("Enter 8-Character Key: ");
        String k = sc.nextLine();

        SecretKey key = new SecretKeySpec(k.getBytes(), "DES");
        Cipher c = Cipher.getInstance("DES");

        c.init(Cipher.ENCRYPT_MODE, key);
        byte[] encrypted = c.doFinal(text.getBytes());

        System.out.println("Encrypted Text: " + Arrays.toString(encrypted));

        c.init(Cipher.DECRYPT_MODE, key);
        byte[] decrypted = c.doFinal(encrypted);

        System.out.println("Decrypted Text: " + new String(decrypted));

        sc.close();
    }
}`, `import javax.crypto.*;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

public class AESCipher {

    public static void main(String[] args) throws Exception {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String text = sc.nextLine();

        System.out.print("Enter 16-Character Key: ");
        String k = sc.nextLine();

        SecretKey key = new SecretKeySpec(k.getBytes(), "AES");
        Cipher c = Cipher.getInstance("AES");

        c.init(Cipher.ENCRYPT_MODE, key);
        byte[] encrypted = c.doFinal(text.getBytes());

        System.out.println("Encrypted Text: " + Arrays.toString(encrypted));

        c.init(Cipher.DECRYPT_MODE, key);
        byte[] decrypted = c.doFinal(encrypted);

        System.out.println("Decrypted Text: " + new String(decrypted));

        sc.close();
    }
}`,
    `import java.math.BigInteger;
import java.nio.file.*;
import java.util.*;

public class RSAFileCipher {

    public static void main(String[] args) throws Exception {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Prime Number p: ");
        BigInteger p = sc.nextBigInteger();

        System.out.print("Enter Prime Number q: ");
        BigInteger q = sc.nextBigInteger();

        BigInteger n = p.multiply(q);
        BigInteger phi = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE));

        System.out.print("Enter Public Key e: ");
        BigInteger e = sc.nextBigInteger();

        BigInteger d = e.modInverse(phi);

        String text = Files.readString(Paths.get("input.txt")).trim();
        BigInteger plainText = new BigInteger(text);

        BigInteger encrypted = plainText.modPow(e, n);
        Files.writeString(Paths.get("encrypted.txt"), encrypted.toString());

        BigInteger decrypted = encrypted.modPow(d, n);
        Files.writeString(Paths.get("decrypted.txt"), decrypted.toString());

        System.out.println("Encrypted Text: " + encrypted);
        System.out.println("Decrypted Text: " + decrypted);

        sc.close();
    }
}`
]



let div = document.getElementById("codes")


codes.map((code)=>{
    div.innerHTML += `<pre>${code}</pre>`
})