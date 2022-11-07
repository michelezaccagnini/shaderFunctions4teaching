#define MIDI_IN iChannel0
#define BUF_A iChannel1
#define FEEDB iChannel2

//draw dots on screen, motion is drawn from accumulated envelope, color from pitch
//we draw it on a buffer so we can apply feedback (trails), not possible on Image

vec2 getPathSine(vec4 note_data, vec4 cc_data)
{
    float pitch  = cc_data.y-0.5;
    float x_pos  = cc_data.x*1.5-0.75;
    return vec2(x_pos,pitch);
    
}

vec2 getPathDelay(vec4 note_data, vec4 cc_data)
{
    float pitch  = note_data.y-0.5;
    float x_pos  = cc_data.x*1.5-0.75;
    return vec2(x_pos,pitch);
    
}
vec3 getBackground(float kick_sah)
{
    return hash31(kick_sah*0.0001+2.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
   // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (fragCoord-iResolution.xy*0.5)/iResolution.y;
    ivec2 iCoo = ivec2(fragCoord);

    vec3 col = vec3(0);

    int kick_id = 0;
    int sine_id = 1;
    int dela_id = 2;

    //Kick
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(kick_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(kick_id,1),0);

        col = getBackground(cc_data.x)*0.2;
        //col = max(col,d*dot_col);
    }

    //Sine
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(sine_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(sine_id,1),0);
        vec2 pos = getPathSine(note_data,cc_data);
        float rad = 0.1*(note_data.x+0.1);
        float smoothness = 0.01;
        float d = Dot(uv, pos, rad,smoothness);
        //vec3 dot_col = hash31(note_data.y*0.0008);
        vec3 dot_col = hash31(note_data.y); //dots are red
        col = max(col,d*dot_col); 
        //col = max(col,d*dot_col);
    }

    //Delay
    {
        vec4 note_data = texelFetch(BUF_A,ivec2(dela_id,0),0);
        vec4 cc_data   = texelFetch(BUF_A,ivec2(dela_id,1),0);
        vec2 pos = getPathDelay(note_data,cc_data);
        float rad = 0.2*(note_data.x+0.0001); 
        float smoothness = 0.01;
        float d = Dot(uv, pos, rad,smoothness);
        //vec3 dot_col = hash31(note_data.y*0.0008);
        vec3 dot_col = hash31(note_data.y); 
        col = max(col,d*dot_col); 
    }
   
    vec3 feed = texture(FEEDB,fragCoord/iResolution.xy).xyz;
    col = max(col,feed*0.8);
    //col = texelFetch(BUF_A,ivec2(fragCoord*0.01),0).xxx;

    fragColor = vec4(col,1);//texelFetch(BUF_A,ivec2(0),0);//
}