#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image


vec2 getPathLead(vec4 note_data, vec4 cc_data)
{
    float radius = 0.2;
    float env = note_data.x;
    float period = cc_data.y*TAU;
    return vec2(cos(period),sin(period))*(radius+env*0.5);  
}

vec2 getPathPatt(vec4 note_data, vec4 cc_data)
{
    float x_pos = cc_data.y*1.-0.5;
    float y_pos = note_data.x*0.2;
    return vec2(x_pos,y_pos-0.2);
}

vec2 getPathHats(vec4 note_data, vec4 cc_data)
{
    float env = note_data.x;
    float x_pos = cc_data.y*1.-0.5;
    float y_pos = cc_data.x*0.2;
    return vec2(x_pos,env+0.3);

}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord-iResolution.xy*0.5)/iResolution.y;
    ivec2 iCoo = ivec2(fragCoord);

    vec3 col = vec3(0);
    int lead_id = 0;
    int bass_id = 1;
    int kick_id = 2;
    int hats_id = 3;
    int patt_id = 4;
    //LEAD
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(lead_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(lead_id,1),0);
        vec2 pos = getPathLead(note_data, cc_data);
        float rad = 0.01;
        float smoothness =0.001;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y);
        col = max(col, d*dot_col*note_data.x*1.) ;
    }
    //PATTERN
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(patt_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(patt_id,1),0);
        vec2 pos = getPathPatt(note_data, cc_data);
        float rad = 0.01+note_data.x*0.02;
        float smoothness =note_data.x*0.1+0.05;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y);
        col = max(col, d*dot_col );
    }
     //HATS
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(hats_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(hats_id,1),0);
        vec2 pos = getPathHats(note_data, cc_data);
        float rad = 0.01+note_data.x*0.02;
        float smoothness =note_data.x*0.1+0.05;
        float d = Dot(uv, pos, rad,smoothness);
        vec3 dot_col = hash31(note_data.y);
        col = max(col,d*dot_col);
    }


   
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = max(col,feed*0.92);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);//texelFetch(BUF_A,ivec2(0),0);//
}