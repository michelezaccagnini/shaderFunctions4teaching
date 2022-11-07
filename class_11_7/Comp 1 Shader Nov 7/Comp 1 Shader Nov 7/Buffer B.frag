#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image


vec2 getPathPatt(vec4 note_data, vec4 cc_data)
{
     float x_pos = cc_data.x*TAU;
     float y_pos = note_data.y;
     return vec2(cos(x_pos),sin(x_pos/4))*y_pos; //do multiplication inside to get spiral shape
     //float x_pos = pow(cc_data.y, 0.5)*1.-0.5; //example from class
     //return vec2(x_pos, 0.) //example from class

}
vec2 getPathPat2(vec4 note_data, vec4 cc_data)
{
     float x_pos = cc_data.x*TAU;
     float y_pos = note_data.y;
     return vec2(cos(x_pos),sin(x_pos/8))*y_pos; //these will move fast
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
    int kick_id = 3;

    //PATTERN
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(patt_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(patt_id,1),0);
        vec2 pos = getPathPatt(note_data, cc_data);
        float rad = 0.0001+note_data.x; //changes
        float smoothness = 0.015;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y*0.0007);
        //col += max(col, d*dot_col);
    }
    //PATTERN2
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(pat2_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(pat2_id,1),0);
        vec2 pos = getPathPat2(note_data, cc_data);
        float rad = 0.1*note_data.x; //makes it so that this pattern only has small dots
        float smoothness = 0.01;
        float d = Dot(uv, pos, rad,smoothness);
        //vec3 dot_col = hash31(note_data.y*0.0008);
        vec3 dot_col = vec3(1,0,0)*10.; //dots are red
        col += max(col, d*dot_col);
    }
     //HATS
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(hats_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(hats_id,1),0);
        vec2 pos = vec2(0.3,0);//getPathHats(note_data, cc_data);
        float rad = 0.1+note_data.y;
        float smoothness = 0.1;
        float d = Dot(uv, pos, rad,smoothness);
        //vec3 dot_col = vec3(1.)*note_data.x;
        //vec3 dot_col = hash31(note_data.y*0.0000001)*note_data.x;
        vec3 dot_col = vec3(0.4,0.15,0.9)*note_data.x; //purple high hats that go with the beat, i looked up rgb for purple and then converted to decimal
        float fade = smoothstep(0.1,0.,length(col));
        col += fade*d*dot_col;// min(col,d*dot_col);
    }
   
   //Kick
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(kick_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(kick_id,1),0);
        vec2 pos = vec2(-0.3,0);//getPathHats(note_data, cc_data);
        float rad = 0.1+note_data.y;
        float smoothness = 0.1;
        float d = Dot(uv, pos, rad,smoothness);
        //vec3 dot_col = vec3(1.)*note_data.x;
        //vec3 dot_col = hash31(note_data.y*0.0000001)*note_data.x;
        vec3 dot_col = vec3(0.4,0.15,0.9)*note_data.x; //purple high hats that go with the beat, i looked up rgb for purple and then converted to decimal
        float fade = smoothstep(0.1,0.,length(col));
        col += fade*d*dot_col;// min(col,d*dot_col);
    }
   
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = max(col,feed*0.9);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);//texelFetch(BUF_A,ivec2(0),0);//
}