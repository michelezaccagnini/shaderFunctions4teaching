#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord-iResolution.xy*0.5)/iResolution.y;
    ivec2 iCoo = ivec2(fragCoord);

    vec4 note1_data = texelFetch(BUF_A,ivec2(0),0);
    vec4 note2_data = texelFetch(BUF_A,ivec2(1,0),0);
    float env1_accum = note1_data.z;
    float env2_accum = note2_data.z;
    vec3 note1_col = hash31(note1_data.y);
    vec3 note2_col = hash31(note2_data.y);
    vec2 pos1 = vec2(cos(env1_accum),sin(env1_accum));
    vec2 pos2 = vec2(cos(env2_accum),sin(env2_accum));
    vec3 col1 = Dot(uv*2.,pos1,0.1)*note1_col;
    vec3 col2 = Dot(uv*2.,pos2,0.1)*note2_col;
    vec3 col = col1+col2;
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = mix(col,feed,0.5);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);
}