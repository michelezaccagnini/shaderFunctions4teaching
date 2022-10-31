#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image


vec2 getPathPatt(vec4 note_data, vec4 cc_data)
{
     float x_pos = cc_data.x*TAU;
     float y_pos = note_data.y;
     return vec2(cos(x_pos),sin(x_pos))*y_pos;
    //float x_pos = pow(cc_data.y, 0.5)*1.-0.5; //example from class
    //return vec2(x_pos, 0.) //example from class

}
vec2 getPathPat2(vec4 note_data, vec4 cc_data)
{
     float x_pos = cc_data.x*TAU;
     float y_pos = note_data.y;
     return vec2(cos(x_pos),sin(x_pos))*y_pos;
    //float x_pos = pow(cc_data.y, 0.5)*1.-0.5; //example from class
    //return vec2(x_pos, 0.) //example from class

}


vec2 getPathHats(vec4 note_data, vec4 cc_data)
{
    float env = note_data.x;
    float x_pos = cc_data.y*1.-0.5;
    float y_pos = cc_data.x;
    return vec2(cos(x_pos), env);

}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord-iResolution.xy*0.5)/iResolution.y;
    ivec2 iCoo = ivec2(fragCoord);

    vec3 col = vec3(0);

    int patt_id = 0;
    int pat2_id = 1;
    int hats_id = 2;

    //PATTERN
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(patt_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(patt_id,1),0);
        vec2 pos = getPathPatt(note_data, cc_data);
        float rad = 0.001+note_data.x;
        float smoothness = 0.01;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y*0.0001);
        col += max(col, d*dot_col);
    }
    //PATTERN2
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(pat2_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(pat2_id,1),0);
        vec2 pos = getPathPat2(note_data, cc_data);
        float rad = 0.001+note_data.x;
        float smoothness = 0.01;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y*0.0001);
        col += max(col, d*dot_col);
    }
     //HATS
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(hats_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(hats_id,1),0);
        vec2 pos = vec2(0);//getPathHats(note_data, cc_data);
        float rad = 0.1*note_data.x;
        float smoothness =0.05;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = vec3(1.)*note_data.x;
        float fade = smoothstep(0.1,0.,length(col));
        col += fade*d*dot_col;// min(col,d*dot_col);
    }
   
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = max(col,feed*0.9);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);//texelFetch(BUF_A,ivec2(0),0);//
}