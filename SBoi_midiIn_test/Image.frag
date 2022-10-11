#define MIDI_IN iChannel0

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    ivec2 iCoo = ivec2(fragCoord*0.05);

    vec3 col = texelFetch(iChannel1,iCoo,0).xyz;

   

    // Output to screen
    fragColor = vec4(col,1.0);
}