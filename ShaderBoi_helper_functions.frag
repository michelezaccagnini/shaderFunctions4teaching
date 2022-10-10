#define HEIGHT_CH_BLOCK 5

float getCCval (int CC, int channel,sampler2D midi_data)

{   
    //add 1 to the channel to make it start from 1   
    int   yco = channel*HEIGHT_CH_BLOCK-2;   
    ivec2 coo = ivec2(CC, yco);   
    float ccv = texelFetch(midi_data, coo,0).x;   
    return ccv;
}