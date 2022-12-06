#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

float sdSegment( in vec2 p, in vec2 a, in vec2 b, in float thick )
{
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h )-thick;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-0.5*iResolution.xy)/iResolution.y;
    float beat = texelFetch(BUF_A,ivec2(0,1),0).x;
    float env = texelFetch(BUF_A,ivec2(0),0).x;
    float whip = 1.-smoothstep(0.1,0.5,uv.x*5.+env);
    uv.y -= sin((whip)*1.)*0.1;
    float cap = 1.-step(0.,sdSegment(uv,vec2(0),vec2(0.7,0),0.05));
    vec3 background = vec3(1)*beat;
    vec3 col = vec3(cap);

    // Output to screen
    fragColor = vec4(background,1.0);
}

