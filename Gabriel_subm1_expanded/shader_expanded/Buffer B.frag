#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image

vec2 getPath(vec4 note_data, float offset)
{
    float env_accum  = note_data.z + .5;
    return vec2(tan(env_accum+offset),sin(env_accum+offset));
    
}

vec2 getPathLead(vec4 note_data, float time)
{
    float cycle = time;
    cycle *= TAU;
    float env = note_data.x*0.4;
    float rad = 0.5;
    vec2 path = vec2(cos(cycle),sin(cycle))*(rad+env);
    return path;
}

vec2 getPathPatt(vec4 note_data, float time)
{
    float cycle = time*1.-0.5;
    
    float env = note_data.x*0.2-0.1;
    float rad = 0.5;
    vec2 path = vec2(cycle,env);
    return path-vec2(0,0.2);
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
    int hast_id = 3;
    int pattern_id = 4;
    //map LEAD
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(lead_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(lead_id,1),0);
        vec2 path = getPathLead(note_data,cc_data.y);
        float smoothing = 0.1;
        float d = Dot(uv*3., path, 0.01+note_data.x*0.1, smoothing );
        vec3 dot_col = hash31(note_data.y);
        col += d*dot_col*(note_data.x+0.4);
    }
    

    //map FAST PATTERN
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(pattern_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(pattern_id,1),0);
        vec2 path = getPathPatt(note_data,cc_data.y);
        float smoothing = 0.05;
        float d = Dot(uv*1., path, 0.01+note_data.x*0.041, smoothing );
        vec3 dot_col = hash31(note_data.y);
        col += d*dot_col*(note_data.x+0.4);
    }
    
    
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = max(col,feed*0.8);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);//texelFetch(BUF_A,ivec2(0),0);//
}