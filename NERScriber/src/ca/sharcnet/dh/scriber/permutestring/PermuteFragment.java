package ca.sharcnet.dh.scriber.permutestring;

import java.util.ArrayList;

public class PermuteFragment extends ArrayList<PermuteResult> {
    private final static String tokenRegex = "[^a-zA-Z0-9'-]";

    public PermuteFragment(String source) {
        String[] tokens = source.split(tokenRegex);

        for (int i = 0; i < tokens.length; i++) {
            for (int j = i; j < tokens.length; j++) {
                StringBuilder builder = new StringBuilder();
                for (int k = i; k <= j; k++) {
                    builder.append(tokens[k].trim());
                    builder.append(" ");
                }
                this.add(new PermuteResult(builder.toString().trim()));
            }
        }

        this.sort((PermuteResult s1, PermuteResult s2) -> s2.toString().length() - s1.toString().length());
    }

}
