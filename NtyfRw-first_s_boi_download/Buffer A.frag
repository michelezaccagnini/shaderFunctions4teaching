#define MIDI_IN iChannel0
#define FEEDB iChannel1

//MIDI data parsing and assignment: each pixel contains data of one of the voices
//INPUT CHANNELS: channel 1 and 2
//INPUT CC : 20 -> pitch, 1 -> envelope
//OUTPUTS PIXELS: pix(0,0), pix(1,0)
//OUTPUTS on single pixel:
                    //pix.x : current envelope 
                    //pix.y : pitch
                    //pix.z :  accumulated envelope

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    ivec2 iCoo = ivec2(fragCoord);
    if(any(greaterThan(iCoo,ivec2(1,0)))) discard;
    float cc_pitch = 0.;
    float cc_env = 0.;
    vec4 last_data =  texelFetch(FEEDB,iCoo,0);
    if(iCoo.x == 0)
    {
        cc_pitch = getCCval(20,1,MIDI_IN)*127.;
        cc_env = getCCval(1,1,MIDI_IN);
        last_data =  texelFetch(FEEDB,iCoo,0);
    }
    if(iCoo.x == 1)
    {
        cc_pitch = getCCval(20,2,MIDI_IN);
        cc_env = getCCval(1,2,MIDI_IN);
        last_data =  texelFetch(FEEDB,iCoo,0);
        
        
    }
    
    
    float midi = texelFetch(MIDI_IN,iCoo,0).x;
    fragColor = vec4(cc_env,cc_pitch,cc_env+last_data.z,1);
}