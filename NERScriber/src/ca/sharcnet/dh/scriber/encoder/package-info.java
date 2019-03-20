/**
The encoder converts XML to the proprietary HTML.  A context file is used to
determine how to translate tags and attributes, the details of which are outlined
below.  The nerve utility library and json library are required to use this
package.
<br>
<br>
A JSON formatted 'context' file defines how the encoder (and decoder) behaves.
The following fields and sub-fields are used.
<ul>
<li>name : the name of the context file, for display purposes.
<li>linkAttribute : the attribute for the external uri for all tagged entities.
<li>idAttribute : the attribute for the internal unique identifier for all tagged entities.
<li>excludedTags : tags that will be skipped during processing.
<li>tag : a list of recognized tagged entity categories.
<ul>
    <li>name : the entity category corresponds with the XML tag name.
    <li>lemmaAttribute : attribute for the common name (lemma) of the tagged entities text.
    <li>alias : an array of recognized alias attribute names that are considered identical to the 'name' value.
</ul>
</ul>
<br>
<br>
The encoder looks for all xml tags that share a name with a tag in the context
'tag' array.  It wraps the contents of the xml source tag in a &lt;tagged&gt; tag.  This
is not a recursive process, any eligable tags within another is ignored.  The following
child nodes are added to the &lt;tagged&gt; node in order: &lt;tagName&gt; &lt;lemma&gt;,
and &lt;attributes&gt;.  The &lt;attributes&gt; node contains zero or more &lt;attribute&gt;
nodes, each with no child nodes and exactly the following two attributes: 'name' and 'value'.
The 'name' attribute must have a non-zero length value string, while the 'value' attribute
can be blank.  If there is no lemma value, the plain text is used instead.  Regarding
the 'tagName' node, the original alias tagName will be stored in an 'alias' attribute,
this may match the used tagName.  If an id attribute does not exist one will be created.
If a lemma lookup takes place, and case sensative exact text match of the entity text
with a known entity in the database will cause the lemma to be overwritten.
<br>
Given the following context file:
<pre>
{
    "name": "orlando",
    "linkAttribute": "ref",
    "idAttribute": "annotationid",
    "tags": [
        {
            "name": "ORGNAME",
            "lemmaAttribute": "REG",
            "alias": ["ORGANIZATION", "orgname"]
        }
    ],
    "excludedTags" : ["noNerve"]
}
</pre>
<u>Example</u><br><br>
Source XML:<br>
&lt;ORGNAME&gt;Elizabeth Mooney&lt;/ORGNAME&gt;<br><br>
Resulting HTML:<br>
&lt;tagged&gt;Elizabeth Mooney&lt;tagName alias="ORGNAME"&gt;ORGNAME&lt;/tagName&gt;&lt;lemma&gt;Elizabeth Mooney&lt;/lemma&gt;&lt;attributes&gt;&lt;attribute name="annotationid" value="NV40032"&gt;&lt;/attribute&gt;&lt;/attributes&gt;&lt;/tagged&gt;
*/

package ca.sharcnet.dh.scriber.encoder;
